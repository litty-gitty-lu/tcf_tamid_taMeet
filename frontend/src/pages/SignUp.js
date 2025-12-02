import logo from '../logo.svg';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiPost } from '../utils/api';

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        try {
            // Call backend signup API
            const response = await apiPost('/auth/signup', {
                name: name,
                email: email,
                password: password
            });
            
            // Store token in localStorage
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                navigate('/onboarding');
            }
        } catch (error) {
            alert(error.message || 'Failed to create account. Please try again.');
            console.error('Signup error:', error);
        }
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
                <form onSubmit={handleSignUp} className="input-boxes">
                    <input 
                        type="text" 
                        placeholder="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <button type="submit">Sign up</button>
                </form>
                <p style={{ color: 'white', marginTop: '20px', fontSize: '14px' }}>
                    Already have an account? <span onClick={handleGoToSignIn} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sign in</span>
                </p>
            </div>

        </div>
    );
}

export default SignUp;

