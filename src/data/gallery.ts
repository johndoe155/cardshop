export interface GalleryCard {
  id: string;
  name: string;
  collection: string;
  style: 'base' | 'holo' | 'cracked-ice' | 'gold';
  type: '1/1' | 'batch';
  image: string;
  quote?: string;
  commissioner?: string;
  price: string;
  year: string;
}

export const galleryData: GalleryCard[] = [
  {
    id: '001',
    name: 'BAYC #2087 - Golden Fur',
    collection: 'Bored Ape Yacht Club',
    style: 'gold',
    type: '1/1',
    image: 'https://picsum.photos/seed/bayc2087/600/840',
    quote: 'Holy. This is heavier than I expected. Museum quality.',
    commissioner: '@ape2087',
    price: '$129',
    year: '2024'
  },
  {
    id: '002',
    name: 'Azuki #9605 - Spirit',
    collection: 'Azuki',
    style: 'holo',
    type: '1/1',
    image: 'https://picsum.photos/seed/azuki9605/600/840',
    quote: 'The holo hits different IRL. Photos don\'t do it justice.',
    commissioner: '@zenft',
    price: '$79',
    year: '2024'
  },
  {
    id: '003',
    name: 'Doodle #6914',
    collection: 'Doodles',
    style: 'cracked-ice',
    type: '1/1',
    image: 'https://picsum.photos/seed/doodle6914/600/840',
    price: '$99',
    year: '2023'
  },
  {
    id: '004',
    name: 'CloneX #4594 - Murakami',
    collection: 'CloneX',
    style: 'holo',
    type: 'batch',
    image: 'https://picsum.photos/seed/clonex4594/600/840',
    quote: 'Batch of 50 for our holders. Flawless.',
    commissioner: 'CloneX DAO',
    price: '$79',
    year: '2024'
  },
  {
    id: '005',
    name: 'Pudgy #3448',
    collection: 'Pudgy Penguins',
    style: 'base',
    type: '1/1',
    image: 'https://picsum.photos/seed/pudgy3448/600/840',
    price: '$49',
    year: '2023'
  },
  {
    id: '006',
    name: 'Moonbird #2642 - Legendary',
    collection: 'Moonbirds',
    style: 'gold',
    type: '1/1',
    image: 'https://picsum.photos/seed/moonbird2642/600/840',
    price: '$129',
    year: '2024'
  },
  {
    id: '007',
    name: 'Ape Reunion Drop',
    collection: 'Ape Reunion',
    style: 'cracked-ice',
    type: 'batch',
    image: 'https://picsum.photos/seed/apereunion/600/840',
    quote: '200 slabs for our IRL meetup. Nemo delivered in 9 days.',
    commissioner: 'Ape Reunion',
    price: '$89',
    year: '2024'
  },
  {
    id: '008',
    name: 'Milady #1523',
    collection: 'Milady Maker',
    style: 'holo',
    type: '1/1',
    image: 'https://picsum.photos/seed/milady1523/600/840',
    price: '$79',
    year: '2024'
  },
  {
    id: '009',
    name: 'DeGods #1234',
    collection: 'DeGods',
    style: 'cracked-ice',
    type: '1/1',
    image: 'https://picsum.photos/seed/degods1234/600/840',
    price: '$99',
    year: '2023'
  },
  {
    id: '010',
    name: 'Captains #888',
    collection: 'Memeland',
    style: 'gold',
    type: 'batch',
    image: 'https://picsum.photos/seed/captains888/600/840',
    price: '$129',
    year: '2024'
  },
  {
    id: '011',
    name: 'Kanpai Panda #420',
    collection: 'Kanpai Pandas',
    style: 'base',
    type: '1/1',
    image: 'https://picsum.photos/seed/kanpai420/600/840',
    price: '$49',
    year: '2023'
  },
  {
    id: '012',
    name: 'Chimpers #1337',
    collection: 'Chimpers',
    style: 'holo',
    type: '1/1',
    image: 'https://picsum.photos/seed/chimpers1337/600/840',
    quote: 'This is now my most prized possession.',
    commissioner: '@chimpermaxi',
    price: '$79',
    year: '2024'
  },
];

export const collections = ['all', 'Bored Ape Yacht Club', 'Azuki', 'Doodles', 'CloneX', 'Pudgy Penguins', 'Moonbirds'];
export const styles = ['all', 'base', 'holo', 'cracked-ice', 'gold'];
