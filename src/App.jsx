import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [escala, setEscala] = useState(1);

  useEffect(() => {
    const ajustarEscala = () => {
      const escalaAncho = window.innerWidth / 2160;
      const escalaAlto = window.innerHeight / 3840;
      setEscala(Math.min(escalaAncho, escalaAlto));
    };

    ajustarEscala();
    window.addEventListener('resize', ajustarEscala);
    return () => window.removeEventListener('resize', ajustarEscala);
  }, []);

  useEffect(() => {
    const obtenerProductos = async () => {
      const dominio = import.meta.env.VITE_SHOPIFY_DOMAIN;
      const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

      const query = "{" +
        "products(first: 50, sortKey: CREATED_AT, reverse: true) {" +
          "edges {" +
            "node {" +
              "id " +
              "title " +
              "vendor " +
              "images(first: 1) { edges { node { url } } } " +
              "variants(first: 1) { edges { node { price { amount } } } }" +
            "}" +
          "}" +
        "}" +
      "}";

      try {
        const respuesta = await fetch("https://" + dominio + "/api/2024-01/graphql.json", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token,
          },
          body: JSON.stringify({ query: query }),
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
      setIndiceActual((prev) => (prev + 5 >= productos.length ? 0 : prev + 5));
    }, 12000);
    return () => clearInterval(interval);
  }, [productos]);

  const formatearPrecio = (precioString) => {
    const numero = parseFloat(precioString);
    if (isNaN(numero)) return precioString;
    if (numero % 1 === 0) {
      return numero.toString(); 
    } else {
      return numero.toFixed(2).replace('.', ','); 
    }
  };

  if (productos.length === 0) return <div className="cargando">Cargando catálogo...</div>;

  const visibles = productos.slice(indiceActual, indiceActual + 5);
  const destacado = visibles[0]?.node;
  const secundarios = visibles.slice(1, 5);
  
  const urlLogo = "https://www.bicosdefio.com/cdn/shop/files/BDEF-LOGO-INSTAGRAM-02_ca782b2c-d60c-4c6e-b256-3232a62ee2e7.jpg";
  const urlQrBase = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.bicosdefio.com";

  return (
    <div className="contenedor-escala">
      <div className="pantalla-gigante" style={{ transform: "scale(" + escala + ")" }}>
        
        <header className="cabecera-premium">
          <img src={urlLogo} className="logo-redondo" alt="logo" />
          <div className="textos-cabecera">
            <h1>RECIÉN LLEGADOS</h1>
            <p className="subtitulo">Descubre las últimas novedades</p>
          </div>
        </header>

        {destacado && (
          <div className="destacado-premium-container">
            <img src={destacado.images.edges[0].node.url} className="imagen-principal" alt="img" />
            <div className="tarjeta-flotante">
              <span className="marca-texto">{destacado.vendor}</span>
              <h2 className="titulo-principal">{destacado.title}</h2>
              <p className="precio-texto">Precio: <strong>{formatearPrecio(destacado.variants.edges[0].node.price.amount)} €</strong></p>
              <div className="boton-look">VER EN TIENDA</div>
            </div>
          </div>
        )}

        <div className="secundarios-grid-look">
          {secundarios.map((item) => (
            <div key={item.node.id} className="tarjeta-secundaria-look">
              <img src={item.node.images.edges[0].node.url} className="imagen-secundaria-look" alt="img" />
              <div className="info-secundaria-look">
                <h3>{item.node.title}</h3>
                <p className="precio-secundario-look">{formatearPrecio(item.node.variants.edges[0].node.price.amount)} €</p>
              </div>
            </div>
          ))}
        </div>

        <div className="seccion-qr-inferior">
          <img src={urlQrBase} className="qr-inferior" alt="qr" />
          <p className="instruccion-qr-inferior">ESCANÉALO Y COMPRA ONLINE</p>
        </div>

        {/* PIE DE PÁGINA (SOLO REDES SOCIALES) */}
        <footer className="pie-premium">
          <div className="pie-redes-iconos">
            <svg viewBox="0 0 24 24" className="icono-red-look"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <svg viewBox="0 0 24 24" className="icono-red-look"><path fill="currentColor" d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            <svg viewBox="0 0 24 24" className="icono-red-look"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            <p className="arroba-look">@bicosdefio &nbsp; | &nbsp; Síguenos</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;