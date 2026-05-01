import React from 'react';
import { Form } from 'react-bootstrap';

const RichTextEditor = ({ value, onChange, dir = 'ltr', showImage = false }) => (
    <Form.Control
        as="textarea"
        rows={12}
        dir={dir}
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
        style={{
            minHeight: 220,
            borderRadius: 12,
            borderColor: 'rgba(20, 40, 70, 0.15)',
        }}
    />
);

export default RichTextEditor;
