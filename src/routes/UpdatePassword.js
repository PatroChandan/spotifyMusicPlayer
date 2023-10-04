import { Icon } from '@iconify/react';
import TextInput from '../components/shared/TextInput';
import PasswordInput from '../components/shared/PasswordInput';
import { Link } from 'react-router-dom';


const UpdatePassword = () =>{
    return(
        <div className="w-full h-full flex flex-col items-center">
            <div className='logo p-5 border-b border-solid border-b-gray-400 w-full flex justify-center'>
                <Icon icon="logos:spotify" width={'150'}/>
            </div>
            <div className='inputRegion w-1/4 py-10 flex items-center justify-center flex-col'>
                <div className='font-bold mb-4'>
                Password Reset
                </div>
                <TextInput label={"Username"} placeholder={"Username"} className={"my-6"}/>
                <TextInput label={"Email address"} placeholder={"Email address"} className={"my-6"}/>
                <PasswordInput label={"Current Password"} placeholder={"Current Password"}/>
                <PasswordInput label={"New Password"} placeholder={"New Password"}/>
                <div className='w-full flex items-center justify-end my-10'>
                    <button className='bg-green-400 text-lg font-semibold p-3 w-full rounded-full'>
                        LOG IN
                    </button>
                </div>
                <div className='w-full border border-solid border-gray-300'></div>
                <div className='my-6 font-semibold text-lg'>
                    Dont't have an account?
                </div>
                <div className='border border-gray-500 text-gray-500 w-full flex items-center justify-center py-3 rounded-full font-bold'>
                <Link to={"/signup"}>SIGN UP FOR SPOTIFY</Link>
                    
                </div>
            </div>
        </div>
    )
}
export default UpdatePassword;