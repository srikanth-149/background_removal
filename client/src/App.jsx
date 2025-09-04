import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'
import Buycredit from './pages/Buycredit'
import Navbar from './components/Navbar'
import Foot from './components/Foot'

const App = () => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Navbar />
      <Routes>
        <Route path='/' element = {<Home/>} />
        <Route path='/Result' element = {<Result/>} />
        <Route path='/Buy' element = {<Buycredit/>} />
        <Route path='/payment/success' element = {<Buycredit/>} />
        <Route path='/payment/cancel' element = {<Buycredit/>} />
      </Routes>
      <Foot />
    </div>
  )
}

export default App
