/** Loading splash sederhana saat aplikasi pertama dimuat. */
export default function Loader({ visible }) {
  return (
    <div className={`loader ${visible ? '' : 'is-hidden'}`} aria-hidden={!visible}>
      <div className="loader__box">
        <span className="loader__mark">A</span>
        <span className="loader__bar">
          <span className="loader__bar-fill" />
        </span>
        <span className="loader__text">APISZ STORE</span>
      </div>
    </div>
  );
}
