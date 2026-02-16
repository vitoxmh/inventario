import './Aside.scss'
import { Link } from "react-router-dom";

export default function AsideGame({clase="", imgPortada = [], imgContraportada = null, cartucho, manual, caja,id,id_imagen, section = null}) {

    return (
    <> 
     <aside className={`sidebar ${clase}`}>
        <div className="sidebar-imagen-principal img-hover">
            <img src={`http://localhost:8080/api/imagenes/uploads/${imgPortada}`} alt="Logo GameVerse" className='logo-aside img-hover-main'/>
            <img src={`http://localhost:8080/api/imagenes/uploads/${imgContraportada}`} alt="Imagen Contraportada" className='imagen-contraportada-aside img-hover-alt'/> 
            <div className="sidebar-imagen-principal-status">Activo</div>
        </div>
        <div className="sidebar-details-info">
             <div className={`sidebar-details${cartucho ? ' sidebar-details-active' : ''}`} >
                <i className='material-icons sidebar-details-icono'>{cartucho ? "check" : "close"}</i>
                <p className="sidebar-details-text">Cartucho/Disco</p>
            </div>
            <div className={`sidebar-details${manual ? ' sidebar-details-active' : ''}`} >
                <i className='material-icons sidebar-details-icono'>{manual ? "check" : "close"}</i>
                <p className="sidebar-details-text">Manual</p>
            </div>
            <div className={`sidebar-details${caja ? ' sidebar-details-active' : ''}`} >
                <i className='material-icons sidebar-details-icono'>{caja ? "check" : "close"}</i>
                <p className="sidebar-details-text">Caja</p>
            </div>

            <Link to={`${section}/${id}/${id_imagen}`} className="sidebar-edit-button">
            <div className={`sidebar-details${caja ? ' sidebar-details-active' : ''}`} >
                <i className='material-icons sidebar-edit-button-icono'>edit</i>
                <p className="sidebar-details-text">Editar</p>
            </div>
            </Link>

            
          
        </div>
        </aside>
    </>
    );
}