from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Enable debug mode
    app.config['DEBUG'] = True

    # Import and register your blueprint here
    from .routes import main
    app.register_blueprint(main)

    return app
