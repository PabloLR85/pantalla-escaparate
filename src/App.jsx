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
      {/* NUEVA CABECERA CON QR INTEGRADO */}
      <header className="cabecera">
        <div className="cabecera-bloque izquierdo">
          <img src={urlLogo} className="logo" alt="logo" />
        </div>
        
        <div className="cabecera-bloque central">
          <h1>RECIÉN LLEGADOS</h1>
        </div>
        
        <div className="cabecera-bloque derecho">
          <p className="qr-texto">ESCANEA Y COMPRA</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.bicosdefio.com" className="qr-img" alt="qr" />
        </div>
      </header>

      {destacado && (
        <div className="destacado-container">
          <img src={destacado.images.edges[0].node.url} className="imagen-destacada" alt="img" />
          <div className="tarjeta-destacada">
            <span className="marca">{destacado.vendor}</span>
            <h2>{destacado.title}</h2>
            {/* Precio con recuadro suave */}
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
              {/* Precio secundario con recuadro suave */}
              <p className="precio-secundario">{item.node.variants.edges[0].node.price.amount} €</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;