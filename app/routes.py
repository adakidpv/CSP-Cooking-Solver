from flask import Blueprint, render_template, request, jsonify, send_from_directory
from app.solver import CookingCSP


main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


@main.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@main.route('/solve', methods=['POST'])
def solve():
    data = request.json
    dishes = data['dishes']
    num_burners = int(data['num_burners'])
    num_pans = int(data['num_pans'])

    solver = CookingCSP(dishes, num_burners, num_pans)
    schedule, steps, domains = solver.solve_with_steps()

    return jsonify({'schedule': schedule, 'steps': steps, 'domains': domains})
