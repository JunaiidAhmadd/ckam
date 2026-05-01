import React from 'react';
import { Nav } from 'react-bootstrap';

const itemClass = (active) => `nav-link rounded-3 px-3 py-2 ${active ? 'active bg-primary text-white' : 'text-dark'}`;

const BuilderSidebar = ({ pages, editorTarget, onSelectPage, onSelectGlobal }) => {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <div className="fw-semibold text-uppercase text-muted small mb-2">Global</div>
        <Nav className="flex-column gap-1">
          <Nav.Link
            className={itemClass(editorTarget.kind === 'global' && editorTarget.id === 'header')}
            onClick={() => onSelectGlobal('header')}
          >
            Header
          </Nav.Link>
          <Nav.Link
            className={itemClass(editorTarget.kind === 'global' && editorTarget.id === 'footer')}
            onClick={() => onSelectGlobal('footer')}
          >
            Footer
          </Nav.Link>
        </Nav>
      </div>

      <div>
        <div className="fw-semibold text-uppercase text-muted small mb-2">Pages</div>
        <Nav className="flex-column gap-1">
          {pages.map((page) => (
            <Nav.Link
              key={page.id}
              className={itemClass(editorTarget.kind === 'page' && editorTarget.id === page.id)}
              onClick={() => onSelectPage(page.id)}
            >
              {page.name}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default BuilderSidebar;
