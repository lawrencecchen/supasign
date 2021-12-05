import React from "react";

function multiply(a: number, b: number) {
  return a * b;
}

const Index = () => {
  let sum = 1 + 1;

  return (
    <div>
      hi tiffany {sum} {multiply(1, 2)}
    </div>
  );
};

export default Index;
