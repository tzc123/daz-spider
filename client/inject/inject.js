export default `
  ._hover:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #666666;
    z-index: 999999;
    opacity: .8;
  }
  img._hover {
    border: 3px solid #666666;
  }
`