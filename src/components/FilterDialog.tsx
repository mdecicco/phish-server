import * as React from 'react';
import styled from 'styled-components';
import { faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FilterButton = styled.div`
    position: absolute;
    min-height: 3em;
    max-height: 3em;
    background-color: #5a5a5a;
    border-radius: calc(1.5em + 1px);
    opacity: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
    transition: background-color 125ms, opacity 125ms, min-width 500ms, max-width 500ms;
    border: 1px solid gray;
    cursor: pointer;
    z-index: 1;
    overflow: hidden;

    :active {
        background-color: #6a6a6a;
        opacity: 0.8;
    }
`;

const FilterIcon = styled.div`
    position: absolute;
    right: 1em;
    top: 1em;
    transition: opacity 250ms;
    z-index: 3;
    pointer-events: none;
`;

const FilterInput = styled.input`
    position: absolute;
    top: 0.0em;
    right: 2em;
    width: calc(100vw - 6em);
    transition: opacity 500ms;
    border: none;
    outline: none;
    padding: 0;
    height: calc(100% - 3px);
    font-size: 1.5em;
    background-color: transparent;
    color: white;
    font-family: monospace;
    z-index: 2;
    pointer-events: none;
    transition: opacity 800ms;
`;

type FilterDialogProps = {
    onSearchChanged?: (value: string) => void,
    search?: string
};

const FilterDialog : React.FC<FilterDialogProps> = (props: FilterDialogProps) => {
    const [open, setOpen] = React.useState(false);
    const [animating, setAnimating] = React.useState(false);
    const [search, setSearch] = React.useState(props.search || '');

    React.useEffect(() => {
        setSearch(props.search || '');
    }, [props.search]);

    const inputRef = React.createRef<HTMLInputElement>();
    return (
        <FilterButton
            style={{ top: 'calc(50% - 1.5em)', right: '2em', minWidth: open ? 'calc(100vw - 4em)' : '3em', maxWidth: '3em' }}
            onClick={() => {
                if (animating) return;
                setAnimating(true);
                setOpen(!open);
                setTimeout(() => {
                    setAnimating(false);
                }, 500);
                if (!open && inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.selectionStart = inputRef.current.selectionEnd = search.length;
                }
                else if (open && props.onSearchChanged) {
                    props.onSearchChanged(search);
                }
            }}
        >
            <FilterInput
                ref={inputRef}
                style={{ opacity: open ? 1 : 0 }}
                onChange={e => { setSearch(e.target.value); }}
                onKeyDown={e => {
                    let enterPressed = false;
                    enterPressed ||= (e.keyCode && e.keyCode === 13) as boolean;
                    enterPressed ||= (e.code && e.code === 'Enter') as boolean;
                    enterPressed ||= (e.code && e.code === 'NumpadEnter') as boolean;
                    enterPressed ||= (e.key && e.key === 'Enter') as boolean;
                    enterPressed ||= (e.key && e.key === 'NumpadEnter') as boolean;
                    if (enterPressed) {
                        if (inputRef.current) inputRef.current.blur();
                        else {
                            setOpen(false);
                            setAnimating(true);
                            setTimeout(() => {
                                setAnimating(false);
                            }, 500);
                            if (props.onSearchChanged) props.onSearchChanged(search);
                        }
                    }
                }}
                onBlur={() => {
                    if (animating && inputRef.current) {
                        inputRef.current.focus();
                        return;
                    }
                    setOpen(false);
                    setAnimating(true);
                    setTimeout(() => {
                        setAnimating(false);
                    }, 500);
                    if (props.onSearchChanged) props.onSearchChanged(search);
                }}
                value={search}
                placeholder='Separate terms with commas'
            />
            <FilterIcon style={{ opacity: open ? 0 : 1  }}>
                <FontAwesomeIcon icon={faFilter}/>
            </FilterIcon>
            <FilterIcon style={{ opacity: open ? 1 : 0  }}>
                <FontAwesomeIcon icon={faSearch}/>
            </FilterIcon>
        </FilterButton>
    );
};

export default FilterDialog;