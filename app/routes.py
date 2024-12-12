from flask import Blueprint, render_template, request, jsonify
from app.solver import CookingCSP

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/solve', methods=['POST'])
def solve():
    data = request.json
    dishes = data['dishes']
    num_burners = int(data['num_burners'])
    num_pans = int(data['num_pans'])

    solver = CookingCSP(dishes, num_burners, num_pans)
    schedule, steps, domains = solver.solve_with_steps()

    return jsonify({'schedule': schedule, 'steps': steps, 'domains': domains})
