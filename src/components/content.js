import TokensOwned from "../dashboard/topnavigation/tokensOwned";

const Content = ({ title }) => (
  <div className="flex flex-col flex-wrap sm:flex-row">
    <TokensOwned />
    <h4 className="flex w-full justify-center pt-32 space-x-7 font-medium leading-tight text-3xl mt-0 mb-2 text-purple-400">
      Pay without trust
    </h4>
    <h1 className="flex w-full justify-center font-medium leading-tight text-5xl mt-0 mb-2 pb-4 text-purple-800">
      Trust Pe trustless payment
    </h1>
    <div className="flex w-full justify-center">
      <a href="admin/pay">
        <button className="flex bg-transparent hover:bg-purple-900 text-purple-600 hover:text-white font-bold  py-3 px-11 border-4 border-purple-500 hover:border-transparent align-center justify-center rounded">
          Pay
        </button>
      </a>
    </div>
  </div>
);

export default Content;
