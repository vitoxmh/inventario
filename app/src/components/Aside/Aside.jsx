import './Aside.scss'

export default function Aside({clase = "", plataformas = []}) {

    return (
    <> 
     <aside className={"sidebar " + clase}>
         <h1 className='title'><i className='title-icono bi-controller'></i>INVENTARIO</h1>
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