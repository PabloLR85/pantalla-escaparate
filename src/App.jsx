import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const obtenerProductos = async () => {
      const dominio = import.meta.env.VITE_SHOPIFY_DOMAIN;
      const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

      const query = `
        {
          products(first: 50, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                title
                vendor
                images(first: 1) {
                  edges {
                    node {
                      url
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const respuesta = await fetch(`https://${dominio}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token,
          },
          body: JSON.stringify({ query }),
        });

        const datos = await respuesta.json();
        
        if (datos.data && datos.data.products) {
          const todosLosProductos = datos.data.products.edges;
          
          const productosFiltrados = todosLosProductos.filter(item => 
            item.node.images.edges.length > 0
          );
          
          setProductos(productosFiltrados);
        }
      } catch (error) {
        console.error("Error al conectar con Shopify:", error);
      }
    };

    obtenerProductos();
    const intervaloCatalogo = setInterval(obtenerProductos, 900000);
    return () => clearInterval(intervaloCatalogo);
  }, []);

  useEffect(() => {
    if (productos.length === 0) return;
    const intervaloRotacion = setInterval(() => {
      setIndiceActual((indicePrevio) => {
        if (indicePrevio + 4 >= productos.length) {
          return 0;
        }
        return indicePrevio + 4;
      });
    }, 12000);
    return () => clearInterval(intervaloRotacion);
  }, [productos]);

  if (productos.length === 0) {
    return <div className="pantalla-gigante cargando">Cargando colección...</div>;
  }

  const productosVisibles = productos.slice(indiceActual, indiceActual + 4);
  const productoDestacado = productosVisibles[0]?.node;
  const productosSecundarios = productosVisibles.slice(1, 4); 
  
  const urlLogo = "https://www.bicosdefio.com/cdn/shop/files/BDEF-LOGO-INSTAGRAM-02_ca782b2c-d60c-4c6e-b256-3232a62ee2e7.jpg";

  return (
    <div className="pantalla-gigante">
      <header className="cabecera">
        <img src={urlLogo} alt="Bicos de Fío" className="logo" />
        <div className="titulos-cabecera">
          <h1>RECIÉN LLEGADOS</h1>
        </div>
      </header>

      {productoDestacado && (
        <section className="destacado-container">
          <img 
            src={productoDestacado.images.edges[0]?.node.url} 
            alt={productoDestacado.title} 
            className="imagen-destacada" 
          />
          <div className="tarjeta-destacada">
            <span className="marca">{productoDestacado.vendor}</span>
            <h2>{productoDestacado.title}</h2>
            <p className="precio">{productoDestacado.variants.edges[0]?.node.price.amount} €</p>
            <div className="boton-falso">VER EN TIENDA</div>
          </div>
        </section>
      )}

      <section className="secundarios-grid">
        {productosSecundarios.map((item) => {
          const producto = item.node;
          return (
            <div key={producto.id} className="tarjeta-secundaria">
              <img 
                src={producto.images.edges[0]?.node.url} 
                alt={producto.title} 
                className="imagen-secundaria" 
              />
              <div className="info-secundaria">
                <h3>{producto.title}</h3>
                <p className="precio-secundario">{producto.variants.edges[0]?.node.price.amount} €</p>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="pie-pagina">
        <div className="qr-placeholder">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.bicosdefio.com" alt="QR Tienda" />
        </div>
        <div className="textos-pie">
          <p className="pie-llamada">ESCANÉALO Y COMPRA ONLINE</p>
          <p className="pie-web">BICOSDEFIO.COM</p>
          <p className="pie-redes">@bicosdefio</p>
        </div>
      </footer>
    </div>
  );
}

export default App;