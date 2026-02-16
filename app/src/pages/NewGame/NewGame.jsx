import Aside from '../../components/Aside/Aside'
import Header from '../../components/Header/Header';
import FormNewGame from '../../components/Forms/FormNewGame';

 
export default function NewGame() {
  return (
    <>
    <div className="container">
        <Aside/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <FormNewGame 
            
            onSuccess={() => {
              alert("Juego creado con éxito");
            }}
            />
          </div>    
        </main>
      </div>
      </>
  );
}