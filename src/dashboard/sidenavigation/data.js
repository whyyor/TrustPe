import HomeIcon from "./icons/home";
import UnverifiedIcon from "./icons/unverified";
import LockedIcon from "./icons/locked";
import PendingIcon from "./icons/pending";
import CreateIcon from "./icons/create";
import PayIcon from "./icons/pay";
import KeyIcon from "./icons/key";

const data = [
  {
    title: "Home",
    icon: <HomeIcon />,
    link: "/",
  },
  {
    title: "Unverified",
    icon: <UnverifiedIcon />,
    link: "/admin/unverified",
  },
  {
    title: "Locked",
    icon: <LockedIcon />,
    link: "/admin/locked",
  },
  {
    title: "Pending",
    icon: <PendingIcon />,
    link: "/admin/pending",
  },
  {
    title: "Create",
    icon: <CreateIcon />,
    link: "/admin/create",
  },
  {
    title: "Pay",
    icon: <PayIcon />,
    link: "/admin/pay",
  },
  {
    title: "Redeem",
    icon: <KeyIcon />,
    link: "/admin/redeem",
  },
];

export default data;
