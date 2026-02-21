import { useState, useEffect } from "react";
import Header from '../../components/Header/Header'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Aside from '../../components/Aside/Aside'
import FormNewConsola from '../../components/Forms/FormNewConsola'
import { Link } from "react-router-dom";
import { API_URL } from '../../config/api'; 
 
export default function NewConsola() {


  return (
    <>
      <div className="container">
        <Aside/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <FormNewConsola/>
          </div>    
        </main>
      </div>
    </>
  );
}