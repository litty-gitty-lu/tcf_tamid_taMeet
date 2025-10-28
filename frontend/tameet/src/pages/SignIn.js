import logo from '../logo.svg';
import '../App.css';
import { useNavigate } from 'react-router-dom';


function SignIn() {
    const navigate = useNavigate();

    const handleSignIn = () => {
        navigate('/dashboard');
    };

    return (
        <div className="SignIn">
            <div className="left-side">
                <img src={logo} className="App-logo" alt="logo" />
                <div class="introductory-text">
                    <h1>WELCOME TO TAMEET!</h1>
                    <h1>SIGN IN TO YOUR ADVENTURE!</h1>
                </div>
            </div>

            <div className="right-side">
                <div className="right-content"></div>
                <div className="title">
                    <h1>SIGN IN</h1>
                    <h3>Sign in with email address</h3>
                </div>
                <div className="input-boxes">
                    <input type="text" placeholder="email" />
                    <input type="text" placeholder="password" />
                    <button onClick={handleSignIn}>Sign in</button>
                </div>
                <hr></hr>
                <p>Or continue with</p>
                <div className="input-buttons">
                    <button onClick={handleSignIn}>Google</button>
                    <button onClick={handleSignIn}>Northeastern</button>
                </div>
            </div>

        </div>
    );
}

export default SignIn;
