import { Link } from "react-router-dom";
import "./Breadcrumb.scss"

export default function Breadcrumb({items = []}) {

   if (!items.length) return null;

  return (

      <nav aria-label="breadcrumb" className="breadcrumb"> 
              
              <Link to="/" className="breadcrumb-item">Home</Link> 
            
             {items.map((item, index) => {
              
                return (<><span className="breadcrumb-separator">/</span><Link className={`breadcrumb-item${item.active ? ' breadcrumb-item-active' : ''}`} key={index} to={item.to}>{item.label}</Link></>);
              })
            }
        </nav>
    )
}

