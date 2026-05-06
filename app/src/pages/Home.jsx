import Header from '../components/Header/Header'
import JuegosPage from '../components/JuegosPage'

export default function Home() {
  return (
    <>
    <Header></Header>
      <main className='container'>
        <h2>Bienvenido al Inventario de Productos</h2>
        <p>Utiliza el menú de navegación para agregar y gestionar tus productos.</p>
        <JuegosPage></JuegosPage>
      </main>
      </>
  );
}