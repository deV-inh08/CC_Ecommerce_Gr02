import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import { paths } from '../../constants/paths';
import { AppContext } from '../../contexts/app.context';
import { useMutation } from '@tanstack/react-query';
import authAPI from '../../api/auth.api';
import Popover from '../Popover';
import { clearLocalStorage, getAccessTokenFromLS, getRefreshTokenFromLS } from '../../utils/auth';
import { useSelector } from 'react-redux';
import { RootState } from '../../CartStore';
import { useQuery } from '@tanstack/react-query';
import ProductApi from '../../api/products.api';
import { debounce } from 'lodash';
import SearchItem from '../SearchItem';

const Header = () => {
  const [search, setSearch] = useState<string | null>(null)
  const { isAuthenticated, setIsAuthenticated } = useContext(AppContext);
  const [ isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const getCartList = useSelector((state: RootState) => state.Cart.cartList);

  const debounceSearch = useMemo(() => debounce((value: string) => {
    setSearch(value)
    }, 500
  ), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value)
  };

  useEffect(() => {
    return () => {
      debounceSearch.cancel();
    };
  }, [debounceSearch]);

  const logoutMutation = useMutation({
    mutationFn: () => {
      const access_token = getAccessTokenFromLS();
      const refresh_token = getRefreshTokenFromLS(); 

      console.log(access_token);
      console.log(refresh_token)
      return authAPI.logoutAccount({access_token, refresh_token})
    },
    onSuccess: () => {
      setIsAuthenticated(false)
      clearLocalStorage()
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate()
  };

  const { data: searchData } = useQuery({
    queryKey: ['/products', search],
    queryFn: () => {
      if(search === "") {
        setSearch(null)
      } else {
        return ProductApi.searchProduct(search as string)
      }
    }
  });

  return (
    <div className="top-0 sticky z-10  shadow-lg font-karla">
      <div className='container flex justify-between mx-auto px-4 py-2 relative bg-white' >
        <Link
          to={paths.home}
          className='font-bold text-2xl'
        >
          Exclusive
        </Link>
       
        <ul className={`flex lg:relative w-auto items-center gap-10 px-4`}>
          <Link
            to={paths.home}
            className=''
          >
            Home
          </Link>
          <Link
            to={paths.contact}
            className=''
          >
            Contact
          </Link>
          <Link
            to={paths.about}
            className=''
          >
            About
          </Link>
          <Link
            to={paths.signup}
            className=''
          >
            Sign up
          </Link>
        </ul>
        <div className='flex gap-4 items-center'>
          <div
            className='lg:flex lg:items-center lg:relative hidden '
          >
            <input
              onChange={(e) => handleInputChange(e)}
              type="text"
              placeholder='What are you looking for?'
              className='border w-full py-1 px-5 mr-5 rounded-md shadow-sm'
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 absolute right-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {
              searchData && searchData.products.length > 0 && (
                <div className='absolute flex flex-col shadow-md -left-2 h-auto top-9 w-full'>
                {searchData && searchData.products && searchData?.products.slice(0, 5).map((item) => {
                  console.log(item)
                  return (
                    <SearchItem item={item}></SearchItem>
                  )
                })}
              </div>
              ) 
            }
          </div>
          <Link className='' to={paths.wishlist}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </Link>
          <Link className='relative' to={paths.cart}>
          {getCartList && getCartList.length > 0 && (
            <span className='absolute -top-4 -right-3 text-white  bg-primaryColor px-2 rounded-full'>{getCartList.length}</span>
          )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </Link>
          {isAuthenticated && (
            <Popover className='flex items-center py-1 hover:text-gray-300 cursor-pointer' renderPopover={
              <div>
                <Link to="/user/profile" className='block text-white py-2 px-5 bg-black/80 backdrop-blur-lg hover:text-orange'>Manage My Account</Link>
                <Link to="/" className='block text-white py-2 px-5 bg-black/80 backdrop-blur-lg hover:text-orange'>My Order</Link>
                <button onClick={handleLogout} type="button" className='text-left text-white w-full block py-2 px-5 bg-black/80 backdrop-blur-lg hover:text-orange'>Logout</button>
              </div>
            }>
              <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 32 32" fill="none">
                <path d="M24 27V24.3333C24 22.9188 23.5224 21.5623 22.6722 20.5621C21.8221 19.5619 20.669 19 19.4667 19H11.5333C10.331 19 9.17795 19.5619 8.32778 20.5621C7.47762 21.5623 7 22.9188 7 24.3333V27" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 14C18.9853 14 21 11.9853 21 9.5C21 7.01472 18.9853 5 16.5 5C14.0147 5 12 7.01472 12 9.5C12 11.9853 14.0147 14 16.5 14Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p></p>
            </Popover>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header;