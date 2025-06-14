import React, {useState} from 'react';
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from '../../components/Input/PasswordInput.jsx';
import { validateEmail } from '../../utils/helper.js';
import axiosInstance from '../../utils/axiosInstance.js';
const Login = () => {
    const [email, setEmail]=useState("");
    const [password,setPassword] =useState("");
    const [error,setError]=useState(null);
    const navigate= useNavigate()

    const handleoauth = async() => {
        try{
            const response = await axiosInstance.get("/auth");
            if (response.data && response.data.accessToken){
                localStorage.setItem("token", response.data.accessToken);
                navigate("/dashboard");
            } 
        }catch(error){
            if (error.response && error.response.data.message){
                setError(error.response.data.message);
            }
            else{
                setError("An unexpected error occured. Please try again");
            }
        }

    }

    const handleLogin = async(e) =>{
        e.preventDefault();

        if (!validateEmail(email)){
            setError("Please enter a valid email address.");
            return;
        }

        if(!password){
            setError("please enter the password");
            return;
        }
        setError("")

        try{
            const response= await axiosInstance.post("/login",{
                email:email,
                password:password,
            } );

            if (response.data && response.data.accessToken){
                localStorage.setItem("token", response.data.accessToken);
                navigate("/dashboard");
            }  
        }
        catch(error){
            if (error.response && error.response.data.message){
                setError(error.response.data.message);
            }
            else{
                setError("An unexpected error occured. Please try again");
            }
        }
    };
    return (
    <>
        <div className='flex grid justify-center  mt-28'>
            <div className='w-96 border rounded bg-white px-7 py-10'>
                <form onSubmit={handleLogin}>
                    <h4 className='text-2xl mb-7'>Login</h4>

                    <input type='text' placeholder='Email' className='input-box'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />

                    

                    <PasswordInput
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    />

                    {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

                    <button type='submit' className='btn-primary'>
                        Login
                    </button>

                    <p className='text-sm text-center mt-4'>
                        Not registered yet?{" "}
                        <Link to="/SignUp" className="font-medium text-primary p-3 underline">
                            create an Account
                        </Link>
                    </p>
                </form>
                
            </div>
            <button type='button' className="w-96 btn-primary" onClick={handleoauth}>
                        sign in with Google
                </button>
        </div>
    </>
    );
};

export default Login;