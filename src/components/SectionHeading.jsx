/** Judul section dengan eyebrow, subjudul, dan garis aksen. */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', action }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow ? <span className="section-heading__eyebrow">{eyebrow}</span> : null}
      <h2 className="section-heading__title">{title}</h2>
      {subtitle ? <p className="section-heading__subtitle">{subtitle}</p> : null}
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
