import logo from '../logo.svg';
import '../App.css';
import { useNavigate } from 'react-router-dom';


function SignUp() {
    const navigate = useNavigate();

    const handleSignUp = () => {
        navigate('/dashboard');
    };

    const handleGoToSignIn = () => {
        navigate('/');
    };

    return (
        <div className="SignIn">
            <div className="left-side">
                <img src={logo} className="App-logo" alt="logo" />
                <div className="introductory-text">
                    <h1>WELCOME TO TAMEET!</h1>
                    <h1>JOIN YOUR ADVENTURE!</h1>
                </div>
            </div>

            <div className="right-side">
                <div className="right-content"></div>
                <div className="title">
                    <h1>SIGN UP</h1>
                    <h3>Create your account</h3>
                </div>
                <div className="input-boxes">
                    <input type="text" placeholder="name" />
                    <input type="text" placeholder="email" />
                    <input type="password" placeholder="password" />
                    <button onClick={handleSignUp}>Sign up</button>
                </div>
                <p style={{ color: 'white', marginTop: '20px', fontSize: '14px' }}>
                    Already have an account? <span onClick={handleGoToSignIn} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sign in</span>
                </p>
            </div>

        </div>
    );
}

export default SignUp;

