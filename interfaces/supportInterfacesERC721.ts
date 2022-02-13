export type SupportInterface = { title: string; value: string };

export const supportInterfacesERC721: Array<SupportInterface> = [
  { title: "ERC-165", value: "0x01ffc9a7" },
  { title: "ERC-721", value: "0x80ac58cd" },
  { title: "MetaDataHash", value: "0x5b5e139f" },
];

export default {
  supportInterfacesERC721,
};
