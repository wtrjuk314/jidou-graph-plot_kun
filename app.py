from flask import Flask, request, jsonify, render_template
import numpy as np
import sympy as sp
import re

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/plot', methods=['POST'])
def plot():
    data = request.get_json()
    formula = data['formula']
    
    # Replace PI() with sympy's pi
    formula = re.sub(r'PI\(\)', 'pi', formula)
    
    x = sp.symbols('x')
    expr = sp.sympify(formula)
    
    x_min = float(data['xMin']) if data['xMin'] is not None else -10
    x_max = float(data['xMax']) if data['xMax'] is not None else 10
    plot_interval = float(data.get('plotInterval', 0.01))  # Get plot interval, default to 0.01
    
    # Calculate the number of points based on the interval
    num_points = int((x_max - x_min) / plot_interval) + 1
    
    # Generate points with specified interval between x_min and x_max
    x_vals = np.linspace(x_min, x_max, num_points)
    y_vals = [float(expr.subs(x, val)) for val in x_vals]
    
    # Round x values to 2 decimal places
    x_vals = np.round(x_vals, 2)
    
    response_data = {'x': x_vals.tolist(), 'y': y_vals}
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)
