export const compareObject = (object1, object2) => {
  const ok = Object.keys;
  const tx = typeof x;
  const ty = typeof y;
  return object1 && object2 && tx === "object" && tx === ty
    ? ok(object1).length === ok(object2).length &&
        ok(object1).every((key) => compareObject(object1[key], object2[key]))
    : object1 === object2;
};
