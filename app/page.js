"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import { Bounce } from "react-toastify";

export default function Home() {
  const [form, setform] = useState({ title: "", content: "", tags: "", createdAt: "", updatedAt: "" })
  const [newNotesArray, setnewNotesArray] = useState([])
  const [allNotes, setallNotes] = useState([])
  const [selectedNote, setselectedNote] = useState(null)
  const [note, setnote] = useState(false)
  const [editingID, seteditingID] = useState(null)
  const [search, setsearch] = useState("")
  const [search2, setsearch2] = useState("")
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

  const parseTags = (tags) =>
    tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);


  const handleChange = (e) => {
    if ((e.target.name) === "title") {
      setform({ ...form, title: e.target.value.toUpperCase() })
    } else if (e.target.name === "content") {
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      let value = textarea.value
      value = value.replace(/(^|\n)-\s*/g, "$1•")
      value = value.replace(/(^|[.\n]\s*|•\s*)([a-z])/g, (match, start, letter) => start + letter.toUpperCase())
      setform({ ...form, content: value })
      setcount(e.target.value.length)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos
      })
    }
    else {
      setform({ ...form, [e.target.name]: e.target.value })
    }
  }

  const saveForm = () => {
    if (!form.title || !form.content) {
      toast.warn(`Please add title and content`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    const tagsArray = Array.from(parseTags(form.tags));

    let updatedNotesArray;
    let updatedNote;
    let newNote;

    if (editingID) {
      updatedNotesArray = newNotesArray.map(item =>
        item.id === editingID
          ? {
            ...item,
            ...form,
            tags: tagsArray,
            updatedAt: new Date().toLocaleString(),
          }
          : item
      );

      updatedNote = updatedNotesArray.find(item => item.id === editingID);
      setselectedNote(updatedNote);
    } else {
      newNote = {
        ...form,
        tags: tagsArray,
        id: uuidv4(),
        pinned: false,
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString(),
      };

      updatedNotesArray = [newNote, ...newNotesArray];
      setselectedNote(newNote);
    }

    localStorage.setItem("newNotes", JSON.stringify(updatedNotesArray));
    setnewNotesArray(updatedNotesArray);
    setallNotes(updatedNotesArray);
    setform({ title: "", content: "", tags: "" });
    seteditingID(null);
    setnote(true);
    setcount(0)
    toast('Added', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light"
    });
  };


  const findNote = (id) => {
    let note = newNotesArray.find((item) => item.id === id)
    setselectedNote(note)
    setnote(true)
    setsidebarOpen(false)
    setsearch2("")
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
      toast('Note Deleted.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    }
  }

  const editNote = (id) => {
    const noteToEdit = newNotesArray.find((item) => item.id === id)
    seteditingID(id)
    setform({
      title: noteToEdit.title,
      content: noteToEdit.content,
      tags: noteToEdit.tags.join(", "),
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
        return item.title.toLowerCase().includes(value.toLowerCase()) || item.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase())) || item.content.toLowerCase().includes(value.toLowerCase())
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

  const tg = newNotesArray.map((item, index) => {
    return item.tags
  })
  const tgarray = tg.reduce((prev, curr) => prev.concat(curr), []).sort()

  const compressedTags = tgarray.reduce((arr, crr, i) => {
    if (i === 0 || crr !== tgarray[i - 1]) {
      arr.push({ crr, count: 1 })
    } else {
      arr[arr.length - 1].count++
    }
    return arr
  }, []).map(i => `${i.crr} ${i.count}`)

  const searchByTag = (tag) => {
    const filtered = newNotesArray.filter(item => item.tags.includes(tag))
    setallNotes(filtered)
    setmatches(filtered.length === 0)
    setsearch(`#${tag}`)
  }
  const renderContentWithLinks = (text) => {
    const regex = /\[\[(.*?)\]\]/g;
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <span key={index} onClick={() => openNoteByTitle(part)} className="cursor-pointer text-blue-400 underline">{part}</span>
      }
      return <span key={index}>{highlightText(part, search2)}</span>
    })
  }

  const openNoteByTitle = (title) => {
    const note = newNotesArray.find((item) => item.title.toLowerCase() === title.toLowerCase()
    )
    if (note) {
      setselectedNote(note)
      setnote(true)
      setsidebarOpen(false)
    } else {
      alert(`No note found with "${title}"`)
    }
  }

  const notesBacklinks = (title) => {
    const pattren = new RegExp(`\\[\\[${title}\\]\\]`, "i")
    return newNotesArray.filter(note => pattren.test(note.content))
  }

  const searchContent = (e) => {
    const value = e.target.value
    setsearch2(value)
  }

  const highlightText = (text, query) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, i) => {
      return part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    })
  }



  return (<>
  <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
    <div className="flex">

      <div onClick={(e) => e.stopPropagation()} className={`left fixed xl:static top-0 left-0 z-40 bg-white md:bg-[#d3d3d3] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0 w-[70vw] sm:w-[50vw] xl:w-[20vw] py-4 border-r min-h-screen `}>
        <div className=" flex flex-col items-center gap-4">
          <h1 className="text-3xl"><span className="text-green-400">&lt;</span>Hyper<span className="text-rose-500">Note</span><span className="text-green-400">&gt;</span></h1>
          <img src="sidebar.svg" alt="sidebar" height={20} width={20} onClick={() => setsidebarOpen(prev => !prev)} className="absolute right-2 top-6 bg-gray-400 p-1 rounded-lg xl:hidden" />
          <div className="relative pb-2 w-full px-0.5">
            <img src="search.svg" alt="search" width={15} height={15} className="absolute left-2 top-2" />
            <input type="text" value={search} name="search" id="search" className={`search py-1 px-7 rounded-full outline outline-gray-500 w-full ${sidebarOpen ? "bg-gray-200" : "bg-white"}`} placeholder="Search" onChange={searchNote} />
          </div>
        </div>
        <hr />
        <div className="py-3">
          <div className="flex justify-between px-3 items-center">
            <h2 className="text-xl">Your Notes</h2>
            <button onClick={() => (setnote(false), setsidebarOpen(false))} className="text-sm py-1 px-3 cursor-pointer bg-green-400 font-semibold rounded-full">Add Note</button>
          </div>
          <div className="mt-6">
            <div className="flex flex-wrap gap-1">
              {compressedTags.map((item, index) => {
                const tag = item.split(" ")[0]
                return <span key={index} onClick={() => searchByTag(tag)} className="bg-slate-100 cursor-pointer rounded-full px-2 py-1 w-fit text-sm">#{item}</span>
              })}
            </div>
            {matches ? "No matches found" : recorded.map((item, index) => {
              return <div key={item.id} onClick={() => { findNote(item.id) }} className="bg-slate-200 my-2 cursor-pointer py-1 px-2 flex justify-between items-center">
                <div>{item.title}</div><div className="flex items-center gap-2"><div>{item.pinned ? (<img src="pin.svg" alt="pin" width={10} height={10} />) : ""}</div><div className="flex gap-1 break-all">{item.tags
                  .map(i => "#" + i.trim())
                  .filter(Boolean)
                  .slice(0, 1)
                  .map((item, index) => {
                    return <span key={index} className="bg-slate-100 rounded-full px-2 py-1 w-fit text-sm">{item}</span>
                  })}</div>
                  {item.tags.map(i => i.trim()).filter(Boolean).length > 1 ? <span>+{item.tags.map(i => i.trim()).filter(Boolean).length - 1}</span> : ""
                  }
                </div>
              </div>

            })}
          </div>
        </div>
      </div>
      <div className="right px-2 py-8 md:p-8 w-[80vw] mx-auto relative" onClick={() => { setsidebarOpen(false) }}>
        <img src="sidebar.svg" alt="sidebar" height={20} width={20} onClick={(e) => {
          e.stopPropagation(); setsidebarOpen(prev => !prev)
        }} className="absolute left-0 top-21 bg-white p-1 rounded-lg xl:hidden" />
        <h1 className="text-4xl xl:hidden block text-center my-10"><span className="text-green-400">&lt;</span>Hyper<span className="text-rose-500">Note</span><span className="text-green-400">&gt;</span></h1>
        <div className={`flex flex-col gap-4 items-center ${note ? "hidden" : ""} relative mt-10`}>
          <input value={form.title} type="text" name="title" id="title" className="title uppercase bg-white xl:w-1/4 sm:w-1/2 w-4/5 py-1 px-4 rounded-full outline outline-gray-500" placeholder="Add title" onChange={handleChange} />
          <div className="xl:w-1/2 sm:w-3/4 w-full flex flex-col items-center gap-3">
            <div className="w-full relative">
              <div className="absolute right-1 top-0 opacity-50 text-sm lg:text-md">{count}/500</div>
              <textarea value={form.content} maxLength={500} name="content" id="content" className="rounded-lg bg-white md:min-h-[20vh] min-h-[12vh] leading-5 w-full px-4 py-2 outline outline-gray-500" placeholder="Enter content*" onChange={handleChange}></textarea>
            </div>
            <input value={form.tags} name="tags" id="tags" type="text" className="tags bg-white px-3 py-1 rounded-full outline outline-gray-500 w-2/5" placeholder="Add tags**" onChange={handleChange} />
          </div>

          <button onClick={() => saveForm()} className="py-2 px-3 cursor-pointer bg-green-400 font-bold rounded-full text-lg">+Add</button>
          <div className="mt-5 text-gray-700">
            <p>* &nbsp;&nbsp;- &nbsp;Type "-" in content to make bullet points and write title of the note you want to link in double square brackets and link notes [[title]].</p>
            <p>** &nbsp;&nbsp;- &nbsp;Separate tags by "," to make independent tags.</p>
          </div>
        </div>
        {selectedNote && <div className={`${note ? "" : "hidden"}`}>
          <div className="flex justify-between">
            <h2 className="font-bold text-xl lg:text-3xl">{selectedNote.title}</h2>
            <div className="flex gap-1.5 sm:gap-2 md:gap-4 items-center justify-end">
              <div className="relative w-1/3 sm:w-1/2 md:w-full">
                <img src="search.svg" alt="search" width={15} height={15} className="absolute left-1 sm:top-[6.5px] top-2.25 w-2 sm:w-3.5" />
                <input type="text" name="search2" id="search2" value={search2} className="bg-white rounded-full pl-3.5 pr-1 py-0.5 sm:px-6 sm:py-1 outline outline-gray-500 w-full text-xs sm:text-sm md:text-md" onChange={searchContent} placeholder="Search" />
              </div>
              <img onClick={() => editNote(selectedNote.id)} src="edit.svg" alt="edit" width={20} height={20} className="cursor-pointer w-4 sm:w-5" />
              <img onClick={() => deleteNote(selectedNote.id)} src="delete.svg" alt="delete" width={20} height={20} className="cursor-pointer w-4 sm:w-5" />
              <img onClick={() => togglePin(selectedNote.id)} src={`${selectedNote.pinned ? "unpin.svg" : "pin.svg"}`} alt="pin" width={20} height={20} className="cursor-pointer w-4 sm:w-5" />
            </div>
          </div>
          <hr />
          <p className="whitespace-break-spaces wrap-break-word text-sm sm:text-md lg:text-xl my-5">{renderContentWithLinks(selectedNote.content)}</p>
          {notesBacklinks(selectedNote.title).length > 0 && <div className="flex gap-2"><span className="font-semibold">Linked from ({notesBacklinks(selectedNote.title).length}):</span>
            <div className="flex gap-3 ">{notesBacklinks(selectedNote.title).map((item, i, arr) => (<span key={item.id}>
              <span onClick={() => findNote(item.id)} className="underline text-blue-400 cursor-pointer ">
                {item.title}
              </span>
              {i < (arr.length - 1) && ","}
            </span>))}</div>
          </div>}
          <p className="flex gap-2 text-sm md:text-md my-2">{selectedNote.tags
            .map(i => "#" + i.trim())
            .filter(Boolean)
            .map((item, index) => {
              return <span key={index} className="bg-slate-100 rounded-full px-2 py-1 w-fit text-sm">{item}</span>
            })}</p>
          <div className="flex gap-5 my-3 text-sm md:text-md"><span>Created: {selectedNote.createdAt}</span><span>Last Updated: {selectedNote.updatedAt}</span>

          </div>
        </div>
        }
      </div>
    </div>
  </>
  );
}
