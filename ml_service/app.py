from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)

def analyze_irrigation_data(data):
    df = pd.DataFrame(data)

    if 'created_at' not in df.columns or 'field2' not in df.columns:
        raise ValueError("Colunas esperadas: 'created_at' e 'field2'")

    df['minute'] = pd.to_datetime(df['created_at'], errors='coerce').dt.floor('min')
    df = df.dropna(subset=['minute', 'field2'])  # Remove dados inválidos

    # Agrupa por minuto e calcula média da umidade
    minute_data = df.groupby('minute')['field2'].mean().reset_index()

    if len(minute_data) < 2:
        raise ValueError("Dados insuficientes para realizar a regressão (mínimo: 2 minutos distintos).")

    # X será o tempo em segundos desde o início da coleta
    X = (minute_data['minute'] - minute_data['minute'].min()).dt.total_seconds().values.reshape(-1, 1)
    y = minute_data['field2'].values

    model = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', LinearRegression())
    ])
    model.fit(X, y)

    decrease_rate = model.named_steps['regressor'].coef_[0]
    max_decrease_time = minute_data.loc[minute_data['field2'].diff().idxmin(), 'minute']
    target_umidity = 40
    current_umidity = minute_data['field2'].iloc[-1]

    if decrease_rate == 0:
        seconds_until_target = float('inf')
    else:
        seconds_until_target = (current_umidity - target_umidity) / abs(decrease_rate)

    return {
        'queda_umidade_por_segundo': round(abs(decrease_rate), 6),
        'momento_maior_queda': str(max_decrease_time),
        'umidade_atual': round(current_umidity, 2),
        'precisao_da_predicao': round(model.score(X, y), 4)
    }


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        result = analyze_irrigation_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@app.route('/test', methods=['GET'])
def test_excel_data():
    try:
        df = pd.read_excel('dados.xlsx')
        result = analyze_irrigation_data(df.to_dict(orient='records'))
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
