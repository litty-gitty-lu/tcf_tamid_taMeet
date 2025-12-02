"""
Main entry point for running the Flask application.
Run this file to start the development server.
"""

from app import create_app

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    # Run the app in development mode
    # debug=True means it will reload when code changes
    # host='0.0.0.0' means it's accessible from any network interface
    # port=5000 is the default Flask port
    app.run(debug=True, host='0.0.0.0', port=5000)

