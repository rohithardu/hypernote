"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [form, setform] = useState({ title: "", content: "", tags: "", createdAt: "", updatedAt: "" })
  const [newNotesArray, setnewNotesArray] = useState([])
  const [allNotes, setallNotes] = useState([])
  const [selectedNote, setselectedNote] = useState(null)
  const [note, setnote] = useState(false)
  const [editingID, seteditingID] = useState(null)
  const [search, setsearch] = useState("")
  const [matches, setmatches] = useState(false)
  const [count, setcount] = useState(0)
  const [sidebarOpen, setsidebarOpen] = useState(false)

  useEffect(() => {


    let stored = localStorage.getItem("newNotes")
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setnewNotesArray(parsed)
        setallNotes(parsed)
      }
    } catch (err) {
      console.log("Invalid data in localStorage", err)
      localStorage.removeItem("newNotes")
    }
  }, [])


  const handleChange = (e) => {
    if ((e.target.name) === "title") {
      setform({ ...form, title: e.target.value.toUpperCase() })
    } else if (e.target.name === "content") {
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      let value = textarea.value
      value = value.replace(/(^|\n)-\s*/g,"$1• ")
      value = value.replace(/(^|[.\n]\s*|•\s*)([a-z])/g,(match,start,letter)=>start + letter.toUpperCase())
      setform({ ...form, content: value })
      setcount(e.target.value.length)

      requestAnimationFrame(()=>{
        textarea.selectionStart = textarea.selectionEnd = cursorPos
      })
    }
    else {
      setform({ ...form, [e.target.name]: e.target.value })
    }
  }

  const saveForm = () => {
    if (!form.title || !form.content) {
      alert("Please add title and content")
      return
    }

    let updatedNotesArray
    let updatedNote
    let newNote
    if (editingID) {
      updatedNotesArray = newNotesArray.map(item =>
        item.id === editingID ? { ...item, ...form, updatedAt: new Date().toLocaleString() } : item
      )
      updatedNote = updatedNotesArray.find((item) => item.id === editingID)
      setselectedNote(updatedNote)
    } else {
      newNote = {
        ...form,
        id: uuidv4(),
        pinned: false,
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString(),
      }
      updatedNotesArray = [newNote, ...newNotesArray]
      setselectedNote(newNote)
    }
    localStorage.setItem("newNotes", JSON.stringify(updatedNotesArray))
    setnewNotesArray(updatedNotesArray)
    setallNotes(updatedNotesArray)
    setform({ title: "", content: "", tags: "" })
    seteditingID(null)
    setnote(true)
  }


  const findNote = (id) => {
    let note = newNotesArray.find((item) => item.id === id)
    setselectedNote(note)
    setnote(true)
    setsidebarOpen(false)
  }

  const deleteNote = (id) => {
    const c = confirm("Are you sure you want to delete this note?")
    if (c) {
      localStorage.setItem("newNotes", JSON.stringify(newNotesArray.filter((item) => item.id !== id)))
      setnewNotesArray(newNotesArray.filter((item) => item.id !== id))
      setallNotes(newNotesArray.filter((item) => item.id !== id))
      if (selectedNote?.id === id) {
        setselectedNote(null)
        setnote(false)
      }
    }
  }

  const editNote = (id) => {
    const noteToEdit = newNotesArray.find((item) => item.id === id)
    seteditingID(id)
    setform({
      title: noteToEdit.title,
      content: noteToEdit.content,
      tags: noteToEdit.tags,
    })
    setselectedNote(null)
    setnote(false)

  }

  const searchNote = (e) => {
    const value = e.target.value
    setsearch(value)
    if (value === "") {
      setallNotes(newNotesArray)
      setmatches(false)
      return
    } else {
      const filtered = newNotesArray.filter((item) => {
        return item.title.toLowerCase().includes(value.toLowerCase()) || item.tags.toLowerCase().includes(value.toLowerCase())
      })
      setallNotes(filtered)
      setmatches(filtered.length === 0)
    }
  }

  const togglePin = (id) => {
    const updated = newNotesArray.map((item) => item.id === id ? { ...item, pinned: !item.pinned } : item)
    let updatedNote = updated.find((item) => item.id === id)
    setselectedNote(updatedNote)
    setnewNotesArray(updated)
    setallNotes(updated)
    localStorage.setItem("newNotes", JSON.stringify(updated))

  }


  const recorded = [
    ...allNotes.filter(i => i.pinned),
    ...allNotes.filter(i => !i.pinned)
  ]
// const searchParams = useSearchParams()
// const tags = searchParams
//   const arr = recorded.map((item,index)=>{
//               item.tags.split(",")
//                 .map(i => i.trim())
//                 .filter(Boolean)
//                 .map((item, index) => 
//                  "#"+item
//                 )})
              
              
//     console.log(arr)
    // console.log(tags)
//   // const tagArray = Array.from()
//   // console.log(tagArray)


  return (<>
    <div className="flex">

      <div className={`left fixed xl:static top-0 left-0 z-40 ${sidebarOpen? "bg-white":""} transform transition-transform duration-300 ease-in-out ${sidebarOpen? "translate-x-0": "-translate-x-full"} xl:translate-x-0 w-[70vw] sm:w-[50vw] xl:w-[20vw] py-4 border-r min-h-screen `}>
        <div className=" flex flex-col items-center gap-4">
          <h1 className="text-3xl"><span className="text-green-400">&lt;</span>Hyper<span className="text-rose-500">Note</span><span className="text-green-400">&gt;</span></h1>
          <img src="sidebar.svg" alt="sidebar" height={20} width={20} onClick={()=>setsidebarOpen(prev=> !prev)} className="absolute right-2 bg-gray-400 p-1 rounded-lg xl:hidden" />
          <div className="relative pb-2">
            <img src="search.svg" alt="search" width={15} height={15} className="absolute left-2 top-2" />
            <input type="text" value={search} name="search" id="search" className={`search py-1 px-7 rounded-full outline outline-gray-500 ${sidebarOpen? "bg-gray-200":"bg-white"}`} placeholder="Search" onChange={searchNote} />
          </div>
        </div>
            <hr />
        <div className="py-3">
          <div className="flex justify-between px-3 items-center">
            <h2 className="text-xl">Your Notes</h2>
            <button onClick={() => (setnote(false), setsidebarOpen(false))} className="text-sm py-1 px-3 cursor-pointer bg-green-400 font-semibold rounded-full">Add Note</button>
          </div>
          <div className="mt-6">
            {/* <div className="flex flex-wrap gap-2">{recorded.map((item,index)=>{
              return <span key={index}>{item.tags.split(",")
                .map(i => "#"+ i.trim())
                .filter(Boolean)
                .map((item, index) => {
                  return <span key={index} className="bg-slate-100 rounded-full px-2 py-1 w-fit text-sm">{item}</span>
                })}</span>
              })}</div> */}
          {matches ? "No matches found" : recorded.map((item, index) => {
            return <div key={index} onClick={() => { findNote(item.id) }} className="bg-slate-200 my-2 cursor-pointer py-1 px-2 flex justify-between items-center">
              <div>{item.title}</div><div className="flex items-center gap-2"><div>{item.pinned ? (<img src="pin.svg" alt="pin" width={10} height={10} />) : ""}</div><div className="flex gap-1 break-all">{item.tags.split(",")
                .map(i => "#"+ i.trim())
                .filter(Boolean)
                .slice(0, 1)
                .map((item, index) => {
                  return <span key={index} className="bg-slate-100 rounded-full px-2 py-1 w-fit text-sm">{item}</span>
                })}</div>
                {item.tags.split(",").map(i => i.trim()).filter(Boolean).length > 1 ? <span>+{item.tags.split(",").map(i => i.trim()).filter(Boolean).length - 1}</span> : ""
                }
              </div>
            </div>

          })}
            </div>
        </div>
      </div>
      <div className="right p-8 w-[80vw] mx-auto relative">
        <img src="sidebar.svg" alt="sidebar" height={20} width={20} onClick={()=>setsidebarOpen(prev=> !prev)} className="absolute left-0 bg-white p-1 rounded-lg xl:hidden" />
         <h1 className="text-4xl xl:hidden block text-center my-10"><span className="text-green-400">&lt;</span>Hyper<span className="text-rose-500">Note</span><span className="text-green-400">&gt;</span></h1>
        <div className={`flex flex-col gap-4 items-center ${note ? "hidden" : ""} relative mt-10`}>
          <input value={form.title} type="text" name="title" id="title" className="title uppercase bg-white xl:w-1/4 sm:w-1/2 w-4/5 py-1 px-4 rounded-full outline outline-gray-500" placeholder="Add title" onChange={handleChange} />
          <div className="xl:w-1/2 sm:w-3/4 w-full flex flex-col items-center gap-3">
            <div className="w-full relative">
              <div className="absolute right-1 top-0 opacity-50">{count}/300</div>
              <textarea value={form.content} maxLength={300} name="content" id="content" className="rounded-lg bg-white md:min-h-[20vh] min-h-[12vh] leading-5 w-full px-4 py-2 outline outline-gray-500" placeholder="Enter content*" onChange={handleChange}></textarea>
            </div>
            <input value={form.tags} name="tags" id="tags" type="text" className="tags bg-white px-3 py-1 rounded-full outline outline-gray-500 w-2/5" placeholder="Add tags**" onChange={handleChange} />
          </div>

          <button onClick={() => saveForm()} className="py-2 px-3 cursor-pointer bg-green-400 font-bold rounded-full text-lg">+Add</button>
          <div className="mt-5 text-gray-700">
            <p>* &nbsp;&nbsp;- &nbsp;Type "-" in content to make bullet points.</p>
            <p>** &nbsp;&nbsp;- &nbsp;Separate tags by "," to make independent tags.</p>
          </div>
        </div>
        {selectedNote && <div className={`${note ? "" : "hidden"}`}>
          <div className="flex justify-between">
            <h2 className="font-bold text-3xl">{selectedNote.title}</h2>
            <div className="flex gap-4 items-center">
              <img onClick={() => editNote(selectedNote.id)} src="edit.svg" alt="edit" width={20} height={20} className="cursor-pointer" />
              <img onClick={() => deleteNote(selectedNote.id)} src="delete.svg" alt="delete" width={20} height={20} className="cursor-pointer" />
              <img onClick={() => togglePin(selectedNote.id)} src={`${selectedNote.pinned ? "unpin.svg" : "pin.svg"}`} alt="pin" width={20} height={20} className="cursor-pointer" />
            </div>
          </div>
          <hr />
          <p className="whitespace-break-spaces wrap-break-word text-xl my-5">{selectedNote.content}</p>
          <p className="flex gap-2">{selectedNote.tags.split(",")
            .map(i => "#"+ i.trim())
            .filter(Boolean)
            .map((item, index) => {
              return <span key={index} className="bg-slate-100 rounded-full px-2 py-1 w-fit text-sm">{item}</span>
            })}</p>
          <div className="flex gap-5 my-3"><span>Created: {selectedNote.createdAt}</span><span>Last Updated: {selectedNote.updatedAt}</span>

          </div>
        </div>
        }
      </div>
    </div>
  </>
  );
}
