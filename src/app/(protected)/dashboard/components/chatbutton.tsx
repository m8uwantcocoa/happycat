'use client'

import React from 'react'
import DashboardChat from './dashboardchat'


export default function ChatButton() {
  const [show, setShow] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="fixed bottom-6 right-6 w-20 h-20 rounded-full overflow-hidden shadow-lg bg-gray-100 flex justify-center items-center hover:animate-spin"
      >
        <img
          src={"/chatbot.svg"}
          alt={"chat bubble"}
          className="w-14 h-14 "
        />
      </button>

      {show && (
        <div className="fixed bottom-28 right-6 w-100 max-w-[90vw] rounded-xl border bg-white p-3 shadow-lg">
          <DashboardChat
          />
        </div>
      )}
    </>
  )
}
