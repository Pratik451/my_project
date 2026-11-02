import React from 'react';
import { MegaMenuItem, Language, NavItem } from '../types';
import { NavDropdown } from './NavDropdown';

interface MegaMenuProps {
  items: MegaMenuItem[];
  lang: Language;
  onItemClick: (item: MegaMenuItem) => void;
  columns?: 2 | 3 | 4;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  items,
  lang,
  onItemClick,
}) => {
  const dummyItem: NavItem = {
    id: 'menu',
    labelEn: 'Menu',
    labelNp: 'मेनु',
    icon: '☰',
    hasMegaMenu: true,
    megaMenuItems: items,
  };

  return (
    <NavDropdown
      item={dummyItem}
      lang={lang}
      onItemClick={onItemClick}
      align="left"
    />
  );
};
