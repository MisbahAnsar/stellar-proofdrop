export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) {
    return address;
  }

  return `${address.slice(0, chars + 1)}…${address.slice(-chars)}`;
}
