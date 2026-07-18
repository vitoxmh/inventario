import './Header.scss'
import { Link, NavLink } from "react-router-dom";

function Header({clase = ""}) {
  return (
      <>
       <header className={`header ${clase}`}>
            <div className='header-menu-container'>
                <div className='header-logo'>
                  <i className='bi-controlle'></i>
                  <h2>Invetario</h2>
                </div> 
                <nav className='header-menu'>
                  <Link to="/" className='header-menu-item'>HOME</Link>
                  <Link to="/games/" className='header-menu-item'>GAMES</Link>
                  <Link to="/consolas/" className='header-menu-item'>Consolas</Link>
                  <Link to="/amiibos/" className='header-menu-item'>Amiibos</Link>
                  <Link to="/libros/" className='header-menu-item'>Libros</Link>
                  <Link to="/accesorios/" className='header-menu-item'>Accesorios</Link>
                  <Link to="/plataformas/" className='header-menu-item'>PLATAFORMA</Link>
                </nav>
            </div>
            <div>
              <input type="text" className='header-input' placeholder='Buscar...'/>
            </div>
          </header> 
          </>

  )
}

export default Header
