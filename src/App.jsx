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
        const respuesta = await fetch("https://" + dominio + "/api/2024-01/graphql.json", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token,
          },
          body: JSON.stringify({ query }),
        });

        const datos = await respuesta.json();
        
        if (datos.data && datos.data.products) {
          const productosFiltrados = datos.data.products.edges.filter(item => 
            item.node.images.edges.length > 0
          );
          setProductos(productosFiltrados);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    obtenerProductos();
    setInterval(obtenerProductos, 900000);
  }, []);

  useEffect(() => {
    if (productos.length === 0) return;
    const interval = setInterval(() => {
      setIndiceActual((prev) => (prev + 4 >= productos.length ? 0 : prev + 4));
    }, 12000);
    return () => clearInterval(interval);
  }, [productos]);

  if (productos.length === 0) return <div className="cargando">Cargando...</div>;

  const visibles = productos.slice(indiceActual, indiceActual + 4);
  const destacado = visibles[0]?.node;
  const secundarios = visibles.slice(1, 4);
  const urlLogo = "https://www.bicosdefio.com/cdn/shop/files/BDEF-LOGO-INSTAGRAM-02_ca782b2c-d60c-4c6e-b256-3232a62ee2e7.jpg";

  return (
    <div className="pantalla-gigante">
      <header className="cabecera">
        <div className="cabecera-bloque izquierdo">
          <img src={urlLogo} className="logo" alt="logo" />
        </div>
        
        <div className="cabecera-bloque central">
          <h1>RECIÉN LLEGADOS</h1>
        </div>
        
        <div className="cabecera-bloque derecho">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.bicosdefio.com" className="qr-img" alt="qr" />
          <p className="qr-texto">ESCANEA Y COMPRA</p>
        </div>
      </header>

      {destacado && (
        <div className="destacado-container">
          <img src={destacado.images.edges[0].node.url} className="imagen-destacada" alt="img" />
          <div className="tarjeta-destacada">
            <span className="marca">{destacado.vendor}</span>
            <h2>{destacado.title}</h2>
            <p className="precio">{destacado.variants.edges[0].node.price.amount} €</p>
            <div className="boton-falso">VER EN TIENDA</div>
          </div>
        </div>
      )}

      <div className="secundarios-grid">
        {secundarios.map((item) => (
          <div key={item.node.id} className="tarjeta-secundaria">
            <img src={item.node.images.edges[0].node.url} className="imagen-secundaria" alt="img" />
            <div className="info-secundaria">
              <h3>{item.node.title}</h3>
              <p className="precio-secundario">{item.node.variants.edges[0].node.price.amount} €</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="pie-pagina-redes">
        <p className="texto-siguenos">SÍGUENOS EN NUESTRAS REDES</p>
        <div className="iconos-redes">
          <svg viewBox="0 0 24 24" className="icono-red">
            <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <svg viewBox="0 0 24 24" className="icono-red">
            <path fill="currentColor" d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
          </svg>
          <svg viewBox="0 0 24 24" className="icono-red">
            <path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.82 5.36-1.5 1.59-3.8 2.2-5.91 1.84-1.95-.33-3.66-1.62-4.52-3.36-.8-1.64-.88-3.65-.2-5.38.74-1.89 2.45-3.31 4.43-3.74 1.2-.26 2.48-.2 3.65.11v4.06c-.33-.09-.67-.14-1.02-.14-.94 0-1.86.38-2.52 1.05-.72.72-.98 1.83-.67 2.82.25.79.82 1.48 1.56 1.83.91.43 2.05.42 2.95-.03.95-.47 1.63-1.4 1.74-2.45.05-.48.05-.97.05-1.45V.02h2.24z"/>
          </svg>
        </div>
        <p className="texto-arroba">@bicosdefio</p>
      </footer>
    </div>
  );
}

export default App;