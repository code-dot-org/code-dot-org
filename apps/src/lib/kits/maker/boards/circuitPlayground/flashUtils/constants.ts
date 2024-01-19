export const REFCNT_FLASH = '0xfffe';
export const VTABLE_MAGIC = 0xf9;
export const ValTypeObject = 4;
export enum BuiltInType {
  BoxedString = 1,
  BoxedNumber = 2,
  BoxedBuffer = 3,
  RefAction = 4,
  RefImage = 5,
  RefCollection = 6,
  RefRefLocal = 7,
  RefMap = 8,
  RefMImage = 9, // microbit-specific
  MMap = 10, // linux, mostly ev3
  BoxedString_SkipList = 11, // used by VM bytecode representation only
  BoxedString_ASCII = 12, // ditto
  ZPin = 13,
  User0 = 16,
}
