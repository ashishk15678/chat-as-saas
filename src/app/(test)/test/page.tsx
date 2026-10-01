"use client";

export default function Page() {
  return (
    <>
      {/*<iframe
        src="http://localhost:3000/embed/cmulolsed000204l2f26a9p2s"
        style={{"width":"300px",height:"600px",border:0,"border-radius":"14px"}}
        title="acme"
      ></iframe>*/}
      <script
        src={process.env.NEXT_PUBLIC_APP_URL + "/widget.js"}
        data-chatline-id="cmulolsed000204l2f26a9p2s"
        defer
      ></script>
    </>
  );
}
