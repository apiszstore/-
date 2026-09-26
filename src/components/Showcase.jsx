import { useMemo, useState } from 'react';
import { showcaseCategories, showcaseProjects } from '../data/showcase';
import { useApp } from '../context/AppContext';
import Icon from './Icons';
import Modal from './Modal';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import Thumb from './Thumb';

/** Section PROJECT SHOWCASE dengan modal detail. */
export default function Showcase() {
  const { navigate } = useApp();
  const [category, setCategory] = useState('All');
  const [active, setActive] = useState(null);

  const filtered = useMemo(
    () =>
      showcaseProjects.filter(
        (item) => category === 'All' || item.category === category,
      ),
    [category],
  );

  return (
    <section className="section showcase" id="showcase">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="SHOWCASE"
            title="PROJECT SHOWCASE"
            subtitle="Beberapa project yang pernah dikerjakan di APISZ STORE."
          />
        </Reveal>

        <Reveal>
          <div className="filters filters--center" role="tablist" aria-label="Filter kategori showcase">
            {showcaseCategories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`filters__item ${category === item ? 'is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid grid--3">
          {filtered.map((project, index) => (
            <Reveal key={project.id} delay={(index % 3) * 60}>
              <article
                className="card shot-card"
                onClick={() => setActive(project)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActive(project);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Lihat project ${project.name}`}
              >
                <div className="shot-card__media">
                  <Thumb src={project.image} seed={project.id} icon={project.icon} alt={project.name} />
                  <span className="shot-card__overlay">
                    <span className="btn btn--soft btn--sm">
                      View Project <Icon name="arrowRight" size={15} />
                    </span>
                  </span>
                </div>
                <div className="shot-card__body">
                  <span className="shot-card__category">{project.category}</span>
                  <h3 className="shot-card__name">{project.name}</h3>
                  <p className="shot-card__text">{project.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.name}
        subtitle={active?.category}
        size="lg"
      >
        {active ? (
          <div className="shot-modal">
            <Thumb
              src={active.image}
              seed={active.id}
              icon={active.icon}
              alt={active.name}
              className="thumb--wide"
            />
            <p className="shot-modal__text">{active.description}</p>
            <div className="shot-modal__actions">
              <button
                type="button"
                className="btn btn--primary btn--md"
                onClick={() => {
                  navigate('/products');
                  setActive(null);
                }}
              >
                Lihat di Store
                <Icon name="arrowRight" size={16} />
              </button>
              <button type="button" className="btn btn--ghost btn--md" onClick={() => setActive(null)}>
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
