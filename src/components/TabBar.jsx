import { AiOutlineHome } from 'react-icons/ai'
import { IoCashOutline } from 'react-icons/io5'
import { GiCharging } from 'react-icons/gi'
import { CgProfile } from 'react-icons/cg'
import { IoStatsChartOutline, IoWalletOutline, IoPeopleOutline, IoArrowDownOutline, IoArrowUpOutline } from 'react-icons/io5'
import { MdSportsCricket } from 'react-icons/md'

function TabBar({ activeTab, setActiveTab, user }) {
    // Don't show tabs if user is not logged in
    if (!user) {
        return null
    }

    // Admin tabs
    const adminNavItems = [
        { id: 'admin-dashboard', label: 'Dashboard', icon: IoStatsChartOutline },
        { id: 'admin-withdrawals', label: 'Withdrawals', icon: IoArrowDownOutline },
        { id: 'admin-payments', label: 'Payments', icon: IoArrowUpOutline },
        { id: 'admin-users', label: 'Users', icon: IoPeopleOutline },
    ]

    // User tabs
    const userNavItems = [
        { id: 'home', label: 'Home', icon: AiOutlineHome },
        { id: 'matches', label: 'Matches', icon: MdSportsCricket },
        { id: 'earnings', label: 'Earnings', icon: IoCashOutline },
        { id: 'recharge', label: 'Recharge', icon: GiCharging },
        { id: 'account', label: 'Account', icon: CgProfile },
    ]

    // Determine which tabs to show
    const navItems = user.isAdmin ? adminNavItems : userNavItems

    return (
        <nav className='absolute bottom-0 left-0 right-0 w-full bg-crickbuzz-green z-50'>
            <div className='flex items-center h-14'>
                {navItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 outline-none border-none ${
                                activeTab === item.id
                                    ? 'bg-green-800'
                                    : 'bg-crickbuzz-green hover:bg-green-700'
                            }`}
                        >
                            <IconComponent className='text-base text-white mb-0.5' />
                            <span className='text-xs font-medium text-white'>{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

export default TabBar

