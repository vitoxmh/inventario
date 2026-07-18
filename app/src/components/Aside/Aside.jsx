import './Aside.scss'
import { Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

export default function Aside({clase = "", plataformas = []}) {
    const { isOpen, closeSidebar } = useSidebar();

    const handleNavClick = () => {
        closeSidebar();
    };

    return (
    <> 
     <div className={"sidebar-overlay" + (isOpen ? " sidebar-overlay--active" : "")} onClick={closeSidebar}></div>
     <aside className={"sidebar " + clase + (isOpen ? " sidebar--open" : "")}>
         <button className='sidebar-close' onClick={closeSidebar} aria-label="Cerrar menu">
           <i className="material-icons">close</i>
         </button>
         <h1 className='title'><i className='title-icono bi-controller'></i>INVENTARIO</h1>
         <nav className='nav sidebar-nav-mobile'>
            <p className='nav-text'>Navegación</p>
            <Link to="/" className='nav-item' onClick={handleNavClick}><i className="material-icons">home</i>Home</Link>
            <Link to="/games/" className='nav-item' onClick={handleNavClick}><i className="material-icons">sports_esports</i>Games</Link>
            <Link to="/consolas/" className='nav-item' onClick={handleNavClick}><i className="material-icons">desktop_windows</i>Consolas</Link>
            <Link to="/amiibos/" className='nav-item' onClick={handleNavClick}><i className="material-icons">figures</i>Amiibos</Link>
            <Link to="/libros/" className='nav-item' onClick={handleNavClick}><i className="material-icons">book</i>Libros</Link>
            <Link to="/accesorios/" className='nav-item' onClick={handleNavClick}><i className="material-icons">headphones</i>Accesorios</Link>
            <Link to="/plataformas/" className='nav-item' onClick={handleNavClick}><i className="material-icons">devices</i>Plataformas</Link>
         </nav>
         <nav className='nav'>
            <p className='nav-text'>Libreria</p>
            <a href="#" className='nav-all'><i className="material-icons">inventory_2</i>Toda la colección <span>1,246</span></a>
             <a href="/favoritos/" className='nav-item'><i className="material-icons">star</i>Favoritos</a>
            <a href="/recien-agregado/" className='nav-item'><i className="material-icons">schedule</i>Recien Agregado</a>
         </nav> 
<p className='nav-text'>Biblioteca</p>
          <nav className='nav nav-platforms mt-20'>
             <a href="/libros/" className='nav-item'><i className="material-icons">book</i>Libros</a>
             <a href="/libros/nuevo/" className='nav-item'><i className="material-icons">add</i>Agregar Libro</a>
             <a href="/accesorios/" className='nav-item'><i className="material-icons">sports_esports</i>Accesorios</a>
             <a href="/accesorios/nuevo/" className='nav-item'><i className="material-icons">add</i>Agregar Accesorio</a>
          </nav>
          <p className='nav-text'>Hardware</p>
          <nav className='nav nav-platforms mt-20'>
            
            {plataformas.map((plataforma) => (
                <a key={plataforma.id} href={`/detalle-plataforma/${plataforma.id}`} className='nav-item'>
                    <i className="nav-item-point" style={{backgroundColor: plataforma.color}}></i>{plataforma.nombre}<span className='nav-item-count'>{plataforma.total}</span>
                </a>
            ))}
        
         </nav>
        </aside>
    </>
    );
}
