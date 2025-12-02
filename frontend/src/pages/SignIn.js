import logo from '../logo.svg';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiPost } from '../utils/api';

function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async (e) => {
        e.preventDefault();
        
        try {
            // Call backend login API
            const response = await apiPost('/auth/login', {
                email: email,
                password: password
            });
            
            // Store token in localStorage
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                navigate('/dashboard');
            }
        } catch (error) {
            alert(error.message || 'Failed to sign in. Please check your credentials and make sure the backend is running.');
            console.error('Login error:', error);
        }
    };

    const handleGoToSignUp = () => {
        navigate('/signup');
    };

    return (
        <div className="SignIn">
            <div className="left-side">
                <img src={logo} className="App-logo" alt="logo" />
                <div className="introductory-text">
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
                <form onSubmit={handleSignIn} className="input-boxes">
                    <input 
                        type="email" 
                        placeholder="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Sign in</button>
                </form>
                <p style={{ color: 'white', marginTop: '20px', fontSize: '14px' }}>
                    Don't have an account? <span onClick={handleGoToSignUp} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sign up</span>
                </p>
            </div>

        </div>
    );
}

export default SignIn;
