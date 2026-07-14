import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, placeholder = 'Search by title, author, or category...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup className="search-bar overflow-hidden border" style={{ borderRadius: '50px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 px-4 py-2"
          style={{ focus: 'none', boxShadow: 'none' }}
        />
        <Button
          type="submit"
          variant="primary"
          className="px-4 border-0 d-flex align-items-center justify-content-center"
          style={{ borderTopRightRadius: '50px', borderBottomRightRadius: '50px' }}
        >
          <FaSearch className="me-2" /> Search
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
