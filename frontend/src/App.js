import { useState } from 'react';
import axios from "axios"
import * as XLSX from "xlsx" 
import './App.css';

function App() {


  const [msg,setmsg] = useState("")
  const[status,setstatus] = useState(false)
  const[emaillist,setEmaillist] = useState([])
  
 
  function handlemsg(event){
    setmsg(event.target.value)
  }

  function handlefile(event){
    const file =  event.target.files[0]

   const reader = new FileReader()
   reader.onload = function(event){
    const data = event.target.result
    const workbook = XLSX.read(data,{type: 'binary' })
    const sheetname = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetname]
    const emaillist = XLSX.utils.sheet_to_json(worksheet,{header:'A'})
    const totalemail = emaillist.map(function(item){return item.A})
    console.log(totalemail)
    setEmaillist(totalemail)
    
   }
   
   reader.readAsBinaryString(file)
  }

  function click(){
    setstatus(true)
    axios.post("http://localhost:5002/sendmail",{msg:msg,emaillist:emaillist})
    .then(function(data){
      if(data.data === true){
        alert("Mail sent successfully..")
        setmsg("")
        setstatus(false)
      }
      else{
        alert("Failed")
      }
    })
  }
  return (
    <div>

    <div className="p-5 bg-blue-800">
      <h1 className='text-2xl px-5 font-medium text-white'>BulkMail</h1>
    </div>

    <div className='p-5 bg-orange-300 '>
      <p className='text-center text-xl font-serif'>We can help your business with sending multiple emails at once</p>
    </div>

    <div className='p-5 bg-gray-100 flex justify-center'>
      <p className='font-serif border-2 bg-white  p-3 rounded w-fit'>Drag and Drop</p>
    </div>
    <div className='bg-blue-500 p-2 flex justify-center'>
      <textarea onChange={handlemsg} value={msg} name="" id="" className='h-36 w-96 border-2 p-1' placeholder='Enter your mail text here'></textarea>
    </div>

      <div className='bg-blue-500 p-5 flex flex-col gap-4 items-center'>
        <input type="file" onChange={handlefile} className='border-4  bg-white border-black border-double p-5'/>
        <p className='bg-blue-800 p-3  text-white rounded-md'>Total number of E-mail in the file : {emaillist.length}</p>
        <button className='bg-orange-500 p-2 border-1 rounded text-white' onClick={click}>{status?"sending...":"send"}</button>
      </div>
    </div>
  );
}

export default App;
