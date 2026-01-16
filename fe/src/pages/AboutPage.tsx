import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          Về DigitalWorld
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Chúng tôi đang nỗ lực cung cấp các sản phẩm chất lượng cao với giá cả
          phải chăng, cùng với dịch vụ khách hàng xuất sắc.
        </p>
      </div>

      {/* Our story section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            Câu chuyện của chúng tôi
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Được thành lập vào năm 2025, DigitalWorld bắt đầu với một ý tưởng
            đơn giản: làm cho việc mua sắm trở nên dễ dàng hơn, thú vị hơn và dễ
            tiếp cận hơn với mọi người. Từ một cửa hàng trực tuyến nhỏ,
            DigitalWorld đã phát triển thành một nền tảng cung cấp hàng ngàn sản
            phẩm thuộc nhiều danh mục khác nhau.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Đội ngũ của chúng tôi đam mê tuyển chọn những sản phẩm tốt nhất và
            tạo ra một trải nghiệm mua sắm liền mạch. Chúng tôi lựa chọn cẩn
            thận từng mặt hàng trong kho hàng của mình để đảm bảo đáp ứng các
            tiêu chuẩn về chất lượng, giá trị và tính bền vững.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400">
            Khi chúng tôi tiếp tục phát triển, cam kết về sự hài lòng của khách
            hàng vẫn là trọng tâm của mọi việc chúng tôi làm. Chúng tôi liên tục
            cải thiện nền tảng, mở rộng phạm vi sản phẩm và tìm ra những cách
            thức mới để làm hài lòng khách hàng.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
            alt="Our team working"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Values section */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-12 mb-20">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-10 text-center">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Chất lượng',
              description:
                'Chúng tôi không bao giờ thỏa hiệp về chất lượng. Mỗi sản phẩm chúng tôi cung cấp đều được lựa chọn và kiểm tra kỹ lưỡng để đảm bảo đáp ứng các tiêu chuẩn cao của chúng tôi.',
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              ),
            },
            {
              title: 'Khách hàng là trên hết',
              description:
                'Khách hàng của chúng tôi là trung tâm của mọi việc chúng tôi làm. Chúng tôi nỗ lực cung cấp dịch vụ và hỗ trợ xuất sắc ở mọi bước trong hành trình mua sắm của bạn.',
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ),
            },
            {
              title: 'Đổi mới',
              description:
                'Chúng tôi không ngừng tìm kiếm những cách mới để cải thiện nền tảng và cung cấp các sản phẩm sáng tạo giúp cuộc sống của bạn tốt hơn và tiện lợi hơn.',
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              ),
            },
          ].map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-sm text-center"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-10 text-center">
          Gặp gỡ đội ngũ của Chúng tôi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: 'Nguyễn Thị Ánh',
              role: 'Người sáng lập & Giám đốc điều hành',
              image:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
            },
            {
              name: 'Trần Văn Bảo',
              role: 'Giám đốc công nghệ',
              image:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
            },
            {
              name: 'Lê Thị Chi',
              role: 'Trưởng bộ phận sản phẩm',
              image:
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
            },
            {
              name: 'Phạm Minh Dũng',
              role: 'Trải nghiệm khách hàng',
              image:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
            },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-12 text-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-4">
          Sẵn sàng để bắt đầu mua sắm?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
          Khám phá các sản phẩm đa dạng của chúng tôi và tìm hiểu lý do tại sao
          hàng ngàn khách hàng chọn DigitalWorld cho nhu cầu mua sắm của họ.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/shop"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Tìm sản phẩm
          </Link>
          <Link
            to="/contact"
            className="bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 font-medium py-3 px-6 rounded-lg hover:bg-primary-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Liên hệ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
