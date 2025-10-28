'use client'

import React from 'react'
import PetChat from './petchat'
import { formatSpeciesName } from '@/lib/pets'


export default function ChatButton({ pet }: { pet: any }) {
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
          <PetChat
            petName={pet.name}
            petSpecies={formatSpeciesName(pet.species)}
            pet={pet}
          />
        </div>
      )}
    </>
  )
}
