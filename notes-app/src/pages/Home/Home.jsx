import React, {useEffect, useState} from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import {MdAdd} from 'react-icons/md';
import moment from "moment";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import {Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
Modal.setAppElement('#root');
const Home=() => {

    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: 'add',
        data:null,
    });

    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        message: "",
        type: "add",
    })

    const [userInfo, setUserInfo] = useState(null);
    const [allNotes, setAllNotes] = useState([]);
    const [isSearch, setIsSearch] = useState(false);
    const navigate= useNavigate();

    const handleEdit = (noteDetails) => {
        setOpenAddEditModal({isShown:true, data:noteDetails, type:"edit"});
    }

    const showToastMessage = (message, type) => {
        setShowToastMsg({
            isShown:true,
            message,
            type
        })
    }

    const handleCloseToast= () => {
        setShowToastMsg({
            isShown:false,
            message:"",
        })
    }

    const getUserInfo = async() => {
        try{
            const response = await axiosInstance.get('/get-user');
            if (response.data && response.data.user){
                setUserInfo(response.data.user);
            }
        }
        catch(error){
            if(error.response.status===401){
                localStorage.clear();
                navigate('/login');
            }
        }

    };

    const getAllNotes = async () => {
        try{
            const response = await axiosInstance.get("/get-all-notes");
            if(response.data && response.data.notes){
                setAllNotes(response.data.notes);
            }
        }
        catch(error) {
            console.log("An unexpected error occured. Please try again");
        }
    }

    const deleteNode = async (data) => {
        const noteId=data._id;
        try{
            const response = await axiosInstance.delete("/delete-note/" + noteId);
            if(response.data && !response.data.error){
                showToastMessage("Note deleted successfully", 'delete')
                getAllNotes()
            }
        }catch(error){
            if(error.response && error.response.data && error.response.data.message){
                console.log("An unexpected error occured. Please try again");
            }
        }
    }


    const onSearchNote = async (query) => {
        try{
            const response=await axiosInstance.get("/search-notes/",{
                params: {query},
            });
            if (response.data && response.data.notes)
            {
                setIsSearch(true);
                setAllNotes(response.data.notes);
            }
        }catch(error){
            console.log(error);
        }
    }

    const updateIsPinned = async (noteData) => {
        console.log(noteData.isPinned)
        const noteId=noteData._id;
        try{
            const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
               isPinned:!noteData.isPinned,
            });
            if(response.data && response.data.note){
                showToastMessage("Note updated successfully")
                getAllNotes()
            }
        }catch(error){
            console.log(error);
        }
    }

    const handleClearSearch = () => {
        setIsSearch(false);
        getAllNotes();
    }

    useEffect(() => {
        getAllNotes();
        getUserInfo();
        return () => {};
    }, []);

    return(
        <>
        <div className="h-screen overflow-y-auto">
        <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}/>

        <div className="container px-1 ">
            {allNotes.length>0 ?<div className="grid grid-cols-3 gap-4 mt-8 flex mb-4">
                {allNotes.map((item, index) => (
                <NoteCard 
                key= {item._id }
                title={item.title}
                content={item.content}
                date={moment(item.createdOn).format('Do MMM YYYY')}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit= {() => handleEdit(item)}
                onDelete= {() =>deleteNode(item) }
                onPinNote= {() =>updateIsPinned(item) }
                />))}
            </div> : (<EmptyCard  imgSrc="/notes-memo-icon-symbol-clipart-with-paperclip-isolated-on-white-background-vector.jpg" message={isSearch ? 'Oops no records found':'start creating your first note! click `add` button to drop down your ideas thoughts and remainders '}/>) }
        </div>
        <button className="w-16 h-16 cursor-pointer flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10" 
        onClick={() => {
            setOpenAddEditModal({isShown:true ,type:"add", data:null});
        }}>
            <MdAdd className="text-{32px} text-white" />
        </button>

        <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
            overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                
            },
        }}
        contentLabel=""
        className="sm:w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-auto"
        
        >
        <AddEditNotes
        type={openAddEditModal.type}
        noteData={openAddEditModal.data}
        onClose={() => {
            setOpenAddEditModal({isShown: false, type: "add", data:null});
        }}
        getAllNotes = {getAllNotes}
         showToastMessage= {showToastMessage}
        />

        
        </Modal>
        <Toast
        isShown= {showToastMsg.isShown}
        message= {showToastMsg.message}
        type= {showToastMsg.type}
        onClose= {handleCloseToast}
        />
        </div>
        </>
    )
}

export default Home