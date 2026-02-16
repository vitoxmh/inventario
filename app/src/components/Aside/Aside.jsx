import './Aside.scss'

export default function Aside({clase = "", plataformas = []}) {

    return (
    <> 
     <aside className={"sidebar " + clase}>
         <h1 className='title'><i className='title-icono'></i>INVENTARIO</h1>
         <nav className='nav'>
            <p className='nav-text'>Libreria</p>
            <a href="#" className='nav-all'><i className="material-icons">inventory_2</i>Toda la colección <span>1,246</span></a>
            <a href="#" className='nav-item'><i className="material-icons">star</i>Favoritos</a>
            <a href="#" className='nav-item'><i className="material-icons">schedule</i>Recien Agregado</a>
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