import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';

import useSite from 'hooks/use-site';
import useSearch, { SEARCH_STATE_LOADED } from 'hooks/use-search';
import { postPathBySlug } from 'lib/posts';

import Section from 'components/Section';

import styles from './Nav.module.scss';

import logo from '../assets/Shongshoy_Logo_animated.svg';
import Image from 'next/image';

import BootContainer from 'react-bootstrap/Container';
import BootNav from 'react-bootstrap/Nav';
import BootNavbar from 'react-bootstrap/Navbar';
import BootNavDropdown from 'react-bootstrap/NavDropdown';

const SEARCH_VISIBLE = 'visible';
const SEARCH_HIDDEN = 'hidden';

const Nav = () => {
  const formRef = useRef();

  const [searchVisibility, setSearchVisibility] = useState(SEARCH_HIDDEN);

  const { metadata = {} } = useSite();
  const { title } = metadata;

  const { query, results, search, clearSearch, state } = useSearch({
    maxResults: 5,
  });

  const searchIsLoaded = state === SEARCH_STATE_LOADED;

  // When the search visibility changes, we want to add an event listener that allows us to
  // detect when someone clicks outside of the search box, allowing us to close the results
  // when focus is drawn away from search

  useEffect(() => {
    // If we don't have a query, don't need to bother adding an event listener
    // but run the cleanup in case the previous state instance exists

    if (searchVisibility === SEARCH_HIDDEN) {
      removeDocumentOnClick();
      return;
    }

    addDocumentOnClick();
    addResultsRoving();

    // When the search box opens up, additionall find the search input and focus
    // on the element so someone can start typing right away

    const searchInput = Array.from(formRef.current.elements).find((input) => input.type === 'search');

    searchInput.focus();

    return () => {
      removeResultsRoving();
      removeDocumentOnClick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVisibility]);

  /**
   * addDocumentOnClick
   */

  function addDocumentOnClick() {
    document.body.addEventListener('click', handleOnDocumentClick, true);
  }

  /**
   * removeDocumentOnClick
   */

  function removeDocumentOnClick() {
    document.body.removeEventListener('click', handleOnDocumentClick, true);
  }

  /**
   * handleOnDocumentClick
   */

  function handleOnDocumentClick(e) {
    if (!e.composedPath().includes(formRef.current)) {
      setSearchVisibility(SEARCH_HIDDEN);
      clearSearch();
    }
  }

  /**
   * handleOnSearch
   */

  function handleOnSearch({ currentTarget }) {
    search({
      query: currentTarget.value,
    });
  }

  /**
   * handleOnToggleSearch
   */

  function handleOnToggleSearch() {
    setSearchVisibility(SEARCH_VISIBLE);
  }

  /**
   * addResultsRoving
   */

  function addResultsRoving() {
    document.body.addEventListener('keydown', handleResultsRoving);
  }

  /**
   * removeResultsRoving
   */

  function removeResultsRoving() {
    document.body.removeEventListener('keydown', handleResultsRoving);
  }

  /**
   * handleResultsRoving
   */

  function handleResultsRoving(e) {
    const focusElement = document.activeElement;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (focusElement.nodeName === 'INPUT' && focusElement.nextSibling.children[0].nodeName !== 'P') {
        focusElement.nextSibling.children[0].firstChild.firstChild.focus();
      } else if (focusElement.parentElement.nextSibling) {
        focusElement.parentElement.nextSibling.firstChild.focus();
      } else {
        focusElement.parentElement.parentElement.firstChild.firstChild.focus();
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (focusElement.nodeName === 'A' && focusElement.parentElement.previousSibling) {
        focusElement.parentElement.previousSibling.firstChild.focus();
      } else {
        focusElement.parentElement.parentElement.lastChild.firstChild.focus();
      }
    }
  }

  /**
   * escFunction
   */

  // pressing esc while search is focused will close it

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      clearSearch();
      setSearchVisibility(SEARCH_HIDDEN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className={styles.nav}>
      <Section className={styles.navSection}>
        <p className={styles.navName}>
          <Link legacyBehavior href="/">
            <Image src={logo} alt={title} width={220} height={140} />
          </Link>
        </p>

        <BootNavbar bg="light" expand="lg">
          <BootContainer fluid>
            <BootNavbar.Toggle aria-controls="basic-navbar-nav" />
            <BootNavbar.Collapse id="basic-navbar-nav">
              <BootNav className="me-auto">
                <BootNav.Link href="/">মূলপাতা</BootNav.Link>
                <BootNav.Link href="/history/">ইতিহাস</BootNav.Link>
                <BootNav.Link href="/library/">গ্রন্থাগার</BootNav.Link>
                <BootNav.Link href="/faq/">উত্তরসমূহ</BootNav.Link>
                <BootNav.Link href="/rules/">নীতিমালা</BootNav.Link>
                <BootNavDropdown title="সংকলন" id="basic-nav-dropdown">
                  <BootNavDropdown.Item href="/references/archive/">প্রবন্ধ সংকলন</BootNavDropdown.Item>
                  <BootNavDropdown.Divider />
                  <BootNavDropdown.Item href="/references/islam/">সংকলন – ইসলাম</BootNavDropdown.Item>
                  <BootNavDropdown.Item href="/references/christianity/">সংকলন – খ্রিষ্টান</BootNavDropdown.Item>

                  <BootNavDropdown.Item href="/references/hinduism/">সংকলন – হিন্দু</BootNavDropdown.Item>
                </BootNavDropdown>
              </BootNav>
              <div className={styles.navSearch}>
                {searchVisibility === SEARCH_HIDDEN && (
                  <button onClick={handleOnToggleSearch} disabled={!searchIsLoaded}>
                    <span className="sr-only">Toggle Search</span>
                    <FaSearch />
                  </button>
                )}
                {searchVisibility === SEARCH_VISIBLE && (
                  <form ref={formRef} action="/search" data-search-is-active={!!query}>
                    <input
                      type="search"
                      name="q"
                      value={query || ''}
                      onChange={handleOnSearch}
                      autoComplete="off"
                      placeholder="Search..."
                      required
                    />
                    <div className={styles.navSearchResults}>
                      {results.length > 0 && (
                        <ul>
                          {results.map(({ slug, title }, index) => {
                            return (
                              <li key={slug}>
                                <Link legacyBehavior tabIndex={index} href={postPathBySlug(slug)}>
                                  <a>{title}</a>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {results.length === 0 && (
                        <p>
                          Sorry, not finding anything for <strong>{query}</strong>
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </BootNavbar.Collapse>
          </BootContainer>
        </BootNavbar>
      </Section>
    </nav>
  );
};

export default Nav;
